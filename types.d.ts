declare global {
    interface RequestConfig {
        setHeaders: {
            Authorization: string;
        };
    }
}

export {};
