export interface UsersIndex {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  role: string;
  company: {
    id: string;
    name: string;
    tin: string;
    company_created_date: Date;
    document: string;
  };
  phone_number: string;
}
