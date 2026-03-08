export interface UserPublic {
  id: string;
  role: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  company?: {
    id: string;
    name: string;
    tin: string;
    company_created_date: Date;
    document: string;
  };
}
