declare module 'axios' {
    export interface AxiosResponse<T = unknown> {
        data: T;
    }

    export interface AxiosInstance {
        get<T = unknown>(url: string): Promise<AxiosResponse<T>>;
        defaults: {
            validateStatus?: (status: number) => boolean;
            transformResponse?: ((data: unknown) => unknown) | Array<(data: unknown) => unknown>;
        };
    }

    const axios: {
        create(config: Record<string, unknown>): AxiosInstance;
    };
    export default axios;
}
