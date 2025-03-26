export interface Panic {
    id: number;
    user_reporter: string;
    provider_name: string;
    severity: string;
    location: string;
    details: string;
    status: string;
    created_at: string;
    is_new?: boolean; // Optional property for tablr row animation (html ui)
  }