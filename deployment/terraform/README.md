# AWS static hosting (Phase 1)

Terraform for hosting the built Angular app on AWS, replacing Firebase Hosting.
This phase provisions **infrastructure only** — nothing builds, uploads or serves
the app yet, and `firebase.json` is untouched, so Firebase remains the live host
until the cutover phase.

## Layout

```
deployment/terraform
├── modules/static-site      reusable S3 + CloudFront module
├── environments/dev         root config for the dev site
├── environments/prod        root config for the prod site
├── moto/provider_override.tf  provider pointing at a local moto server
└── validate-with-moto.sh    init → validate → plan → apply → read back → destroy
```

The module creates:

| Resource | Purpose |
| --- | --- |
| `aws_s3_bucket` | Holds the contents of `dist/angular-hnpwa` |
| `aws_s3_bucket_public_access_block` | Bucket is never publicly readable |
| `aws_s3_bucket_ownership_controls` | `BucketOwnerEnforced`, ACLs disabled |
| `aws_s3_bucket_versioning` | Keeps previous builds for rollback |
| `aws_s3_bucket_server_side_encryption_configuration` | SSE-S3 at rest |
| `aws_cloudfront_origin_access_control` | SigV4 access from CloudFront to S3 |
| `aws_cloudfront_distribution` | Public edge, HTTPS only |
| `aws_s3_bucket_policy` | `s3:GetObject` limited to this distribution |

Behaviour that matters for this app:

* `default_root_object = index.html`.
* 403 and 404 from S3 are rewritten to `/index.html` with a 200 so Angular's
  client side routes (`/news/2`, `/item/123`, `/user/x`) resolve on a hard load.
* The catch-all behaviour has `default_ttl = 0`, so `index.html`,
  `ngsw.json` and `ngsw-worker.js` are revalidated on every request — required
  for the service worker to notice new builds.
* `*.js`, `*.css` and `/assets/*` are cached for a year; the production build
  uses `outputHashing: all`, so those names change per release.

## Local validation against moto

No AWS account is used. `moto_server` emulates S3 and CloudFront locally.

```bash
MOTO_IAM_LOAD_MANAGED_POLICIES=true moto_server -H 127.0.0.1 -p 5000 &
cd deployment/terraform
./validate-with-moto.sh dev
```

The script copies `moto/provider_override.tf` into the environment directory
(Terraform merges `*_override.tf` over the real provider block), runs the full
apply/destroy cycle and reads the created resources back through the AWS CLI.
The override file is deleted again on exit and is gitignored, so the committed
provider configuration always targets real AWS.

Last run: **8 resources applied, 8 destroyed** for `dev`.

### Known gaps in the moto validation

These are limitations of the emulator, not of the configuration. They are not
validated by the local cycle and must be checked on a first real deployment:

* **Origin access control is not attached.** moto accepts
  `CreateOriginAccessControl` and stores the control, but drops
  `OriginAccessControlId` from the distribution origin on read. As a result a
  `terraform plan` immediately after `apply` against moto is **not empty**: it
  wants to re-set the origin's `origin_access_control_id` (and, downstream, the
  bucket policy that references the distribution ARN). Against real AWS the
  value is returned and the plan converges.
* `viewer_certificate.ssl_support_method` is likewise not echoed back by moto
  and shows up in the same non-empty plan.
* CloudFront caching semantics, TLS, compression and the 403/404 → `index.html`
  rewrite are stored as configuration only; moto does not serve traffic, so the
  rewrite is verified as configuration, not as an HTTP response.
* No `aws_acm_certificate`, alias or Route 53 record exists yet — the site is
  reachable only on the generated `*.cloudfront.net` domain. Custom domains are
  a later phase.
* No remote state backend is configured; state is local. A shared S3/DynamoDB
  backend should be added before anyone applies this to a real account.

## Deploying to a real account

```bash
cd deployment/terraform/environments/prod
terraform init
terraform plan -out=tfplan     # bucket_name must be globally unique
terraform apply tfplan
```

`bucket_name` is set per environment in `terraform.tfvars`; override it if the
name is taken. Uploading the built site and invalidating the cache is a later
phase — this configuration deliberately has no build or deploy step.

## Rollback

* **Infrastructure**: `terraform apply` of the previous commit reverts a change
  in place; `terraform destroy` removes the environment entirely. Firebase
  Hosting is unaffected by anything here, so reverting to Firebase during this
  phase requires no action.
* **Content**: the bucket is versioned, so a bad release is rolled back by
  restoring the previous object versions and issuing a CloudFront invalidation
  for `/*`.
