import { http } from "./http";
import type { CreateTestimonialPayload, PaginatedList, RawTestimonial } from "../types";

export const testimonialsApi = {
  list: () => http.get<PaginatedList<RawTestimonial>>("/admin/testimonials", { take: 20 }),
  create: (data: CreateTestimonialPayload) =>
    http.post<RawTestimonial>("/admin/testimonials", data),
  remove: (id: string) => http.delete(`/admin/testimonials/${id}`),
};
