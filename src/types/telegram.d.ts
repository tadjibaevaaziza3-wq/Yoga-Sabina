export { }

declare global {
    interface Window {
        Telegram: TelegramWebApp;
    }
}

interface TelegramWebApp {
    WebApp: {
        initData: string;
        initDataUnsafe: {
            query_id?: string;
            user?: TelegramUser;
            auth_date?: string;
            hash?: string;
            start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
            isVisible: boolean;
            onClick: (callback: () => void) => void;
            offClick: (callback: () => void) => void;
            show: () => void;
            hide: () => void;
        };
        MainButton: {
            text: string;
            color: string;
            textColor: string;
            isVisible: boolean;
            isActive: boolean;
            isProgressVisible: boolean;
            setText: (text: string) => void;
            onClick: (callback: () => void) => void;
            offClick: (callback: () => void) => void;
            show: () => void;
            hide: () => void;
            enable: () => void;
            disable: () => void;
            showProgress: (leaveActive: boolean) => void;
            hideProgress: () => void;
        };
        HapticFeedback: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
    };
}

interface TelegramUser {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    added_to_attachment_menu?: boolean;
    allows_write_to_pm?: boolean;
    photo_url?: string;
}
