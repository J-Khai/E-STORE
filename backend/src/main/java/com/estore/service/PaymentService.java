package com.estore.service;

import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    // Luhn algorithm - learned this in class, basically a checksum for card numbers
    public boolean isValidLuhn(String cardNumber) {
        // strip spaces and dashes so formatting doesn't break it
        String digits = cardNumber.replaceAll("\\s|-", "");

        if (digits.length() < 13 || digits.length() > 19) {
            return false;
        }

        int total = 0;
        boolean doubleIt = false;

        // go right to left, double every second digit
        for (int i = digits.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(digits.charAt(i));
            if (doubleIt) {
                digit *= 2;
                if (digit > 9) digit -= 9; // same as summing both digits
            }
            total += digit;
            doubleIt = !doubleIt;
        }

        return total % 10 == 0;
    }
}
