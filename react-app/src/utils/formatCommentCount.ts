export function formatCommentCount(comment: number): string {
    if (comment > 0) {
        const st = comment === 1 ? 'comment' : 'comments';
        return `${comment} ${st}`;
    }
    return 'discuss';
}
