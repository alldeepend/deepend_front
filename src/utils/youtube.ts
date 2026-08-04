export function getYouTubeEmbedUrl(url: string): string | null {
    try {
        const u = new URL(url);
        let videoId: string | null = null;
        if (u.hostname === 'youtu.be') {
            videoId = u.pathname.slice(1).split('?')[0];
        } else if (u.hostname.includes('youtube.com')) {
            if (u.pathname.startsWith('/embed/')) {
                videoId = u.pathname.split('/embed/')[1].split('?')[0];
            } else {
                videoId = u.searchParams.get('v');
            }
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
        return null;
    }
}
