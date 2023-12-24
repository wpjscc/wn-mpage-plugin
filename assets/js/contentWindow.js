window.iFrameResizer = {
    onReady() {
        if ('parentIFrame' in window) {
            window.parentIFrame.sendMessage({
                type:"mpage",
                data:{
                    type: 'event',
                    event: {
                        event_type: 'setTitle',
                        data: {
                            title: document.title
                        }
                    }
                }
            });
            window.parentIFrame.sendMessage({
                type:"mpage",
                data:{
                    type: 'event',
                    event: {
                        event_type: 'reportHref',
                        data: {
                            href: location.href
                        }
                    }
                }
            });
        }
    }
}