package com.khojdu.backend.mapper;

import com.khojdu.backend.dto.inquiry.InquiryResponse;
import com.khojdu.backend.entity.Inquiry;
import org.springframework.stereotype.Component;

@Component
public class InquiryMapper {

    public InquiryResponse toInquiryResponse(Inquiry inquiry) {
        InquiryResponse response = new InquiryResponse();
        response.setId(inquiry.getId());
        response.setPropertyId(inquiry.getProperty().getId());
        response.setPropertyTitle(inquiry.getProperty().getTitle());
        response.setTenantId(inquiry.getTenant().getId());
        response.setTenantName(inquiry.getTenant().getFullName());
        response.setLandlordId(inquiry.getLandlord().getId());
        response.setLandlordName(inquiry.getLandlord().getFullName());
        response.setMessage(inquiry.getMessage());
        response.setContactMethod(inquiry.getContactMethod());
        response.setStatus(inquiry.getStatus());
        response.setCreatedAt(inquiry.getCreatedAt());
        return response;
    }
}
