export type ComplaintType =
  | "FRAUD"
  | "OVERCHARGING"
  | "FAKE_LISTING"
  | "HARASSMENT"
  | "PROPERTY_MISMATCH"
  | "POOR_MAINTENANCE"
  | "OTHER"

export type ComplaintStatus = "PENDING" | "INVESTIGATING" | "RESOLVED" | "DISMISSED"

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export interface Complaint {
  id: string
  complainantId?: string
  complainantName?: string
  propertyId?: string
  propertyTitle?: string
  landlordId?: string
  landlordName?: string
  complaintType: ComplaintType
  subject: string
  description: string
  evidenceUrls?: string[]
  status?: ComplaintStatus
  priority?: ComplaintPriority
  assignedToId?: string
  assignedToName?: string
  resolutionNotes?: string
  createdAt?: string
  resolvedAt?: string
}
