package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.inquiry.InquiryRequest;
import com.khojdu.backend.dto.inquiry.InquiryResponse;
import com.khojdu.backend.dto.inquiry.MessageRequest;
import com.khojdu.backend.dto.inquiry.MessageResponse;

import java.util.List;
import java.util.UUID;

public interface InquiryService {
    InquiryResponse createInquiry(String userEmail, InquiryRequest request);
    PagedResponse<InquiryResponse> getUserInquiries(String userEmail, int page, int size);
    PagedResponse<InquiryResponse> getLandlordInquiries(String landlordEmail, int page, int size);
    List<MessageResponse> getInquiryMessages(UUID inquiryId, String userEmail);
    MessageResponse sendMessage(UUID inquiryId, String userEmail, MessageRequest request);
    void markMessagesAsRead(UUID inquiryId, String userEmail);
}