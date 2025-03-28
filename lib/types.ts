export interface Donor {
  id: string;
  name: string;
  fssai_license_auto_verify: boolean;
  address_map_link: string;
  phone_no: string;
  email: string;
  health_and_safety_cert: string;
  operational_hours: string;
  food_preference: string;
  created_at: Date;
  average_rating: number;
  total_ratings: number;
}

export interface NGO {
  id: string;
  name: string;
  reg_no: string;
  address_map_link: string;
  operating_hours: string;
  contact_person: string;
  charity_license_verification: boolean;
  fcra_reg_no: string;
  food_preference: string;
  verified: boolean;
  created_at: Date;
}

export interface DonorForm {
  id: string;
  food_name: string;
  food_image: string;
  preparation_date_time: Date;
  expiry_date_time: Date;
  food_type: string;
  serves: number;
  storage: string;
  preferred_pickup_time: string;
  donor_id: string;
  created_at: Date;
}

export interface Order {
  id: string;
  donor_form_id: string;
  ngo_id: string;
  serves: number;
  OTP: number;
  created_at: Date;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone_no: number;
  order_id: string;
}

export interface Rating {
  id: string;
  order_id: string;
  rating: number;
  feedback: string;
}