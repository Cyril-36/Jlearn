export {};

declare global {
  interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
  }

  interface GoogleAccountsIdConfiguration {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }

  interface GoogleRenderButtonOptions {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'pill' | 'rectangular' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: number | string;
  }

  interface GoogleAccountsId {
    initialize: (config: GoogleAccountsIdConfiguration) => void;
    renderButton: (parent: HTMLElement, options: GoogleRenderButtonOptions) => void;
    prompt: () => void;
  }

  interface GoogleAccounts {
    id: GoogleAccountsId;
  }

  interface GoogleNamespace {
    accounts: GoogleAccounts;
  }

  interface Window {
    google?: GoogleNamespace;
  }
}
