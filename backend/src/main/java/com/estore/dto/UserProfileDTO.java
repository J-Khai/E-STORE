package com.estore.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfileDTO {
    private String firstName;
    private String lastName;
    private String email;
    private AddressDTO address;
    private List<PaymentMethodDTO> paymentMethods;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddressDTO {
        private String street;
        private String city;
        private String state;
        private String zip;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentMethodDTO {
        private Long id;
        private String cardType;
        private String lastFourDigits;
        private String expiryDate;
        private String paymentToken;
    }
}
