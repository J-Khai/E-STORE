package com.estore.controller;

import com.estore.dto.UserProfileDTO;
import com.estore.model.Address;
import com.estore.model.PaymentMethod;
import com.estore.model.User;
import com.estore.repository.AddressRepository;
import com.estore.repository.PaymentMethodRepository;
import com.estore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
// this is for users to see and change their own settings
public class ProfileController {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    // fetches the profile data for the logged in user
    @GetMapping
    public ResponseEntity<UserProfileDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmailWithAddress(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(buildProfileDTO(user));
    }

    // lets users update their name or address
    @PutMapping
    public ResponseEntity<UserProfileDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserProfileDTO dto) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmailWithAddress(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());

        if (dto.getAddress() != null) {
            Address address = user.getAddress();
            if (address == null) {
                address = new Address();
                address.setUser(user);
                user.setAddress(address);
            }
            address.setStreet(dto.getAddress().getStreet());
            address.setCity(dto.getAddress().getCity());
            address.setState(dto.getAddress().getState());
            address.setZipCode(dto.getAddress().getZip()); 
        }

        userRepository.save(user);

        return ResponseEntity.ok(buildProfileDTO(user));
    }

    // allows users to save a new payment card to their account
    @PostMapping("/payment")
    public ResponseEntity<UserProfileDTO> addPaymentMethod(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserProfileDTO.PaymentMethodDTO dto) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmailWithAddress(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        PaymentMethod pm = PaymentMethod.builder()
                .user(user)
                .cardBrand(dto.getCardType())
                .lastFourDigits(dto.getLastFourDigits())
                .expirationDate(dto.getExpiryDate())
                .gatewayToken("TOK_" + java.util.UUID.randomUUID().toString())
                .build();
        
        paymentMethodRepository.save(pm);
        return ResponseEntity.ok(buildProfileDTO(user));
    }

    private UserProfileDTO buildProfileDTO(User user) {
        Address address = user.getAddress();
        List<PaymentMethod> paymentMethods = paymentMethodRepository.findByUserId(user.getId());

        UserProfileDTO.AddressDTO addressDTO = null;
        if (address != null) {
            addressDTO = UserProfileDTO.AddressDTO.builder()
                    .street(address.getStreet())
                    .city(address.getCity())
                    .state(address.getState())
                    .zip(address.getZipCode())
                    .build();
        }

        List<UserProfileDTO.PaymentMethodDTO> paymentMethodDTOs = paymentMethods.stream()
                .map(pm -> UserProfileDTO.PaymentMethodDTO.builder()
                        .cardType(pm.getCardBrand())
                        .lastFourDigits(pm.getLastFourDigits())
                        .expiryDate(pm.getExpirationDate())
                        .paymentToken(pm.getGatewayToken())
                        .build())
                .toList();

        return UserProfileDTO.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .address(addressDTO)
                .paymentMethods(paymentMethodDTOs)
                .build();
    }
}
