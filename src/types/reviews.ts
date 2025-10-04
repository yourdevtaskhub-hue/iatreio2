export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  session_topic: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ReviewSubmission {
  name: string;
  rating: number;
  text: string;
  session_topic: string;
}
