package com.estore.service;

import com.estore.dto.CheckoutRequest;
import com.estore.dto.CheckoutResponse;

import java.util.List;
import com.estore.dto.OrderResponseDTO;

public interface OrderService {
    CheckoutResponse checkout(String email, CheckoutRequest request);
    List<OrderResponseDTO> getMyOrders(String email);
}
