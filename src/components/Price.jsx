import React from 'react';
import { useStore } from '../store/useStore';

const Price = ({ amount, className = "" }) => {
    const { currency = 'INR', currencyRates = { 'INR': 1, 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0093 } } = useStore();

    const convertPrice = (val) => {
        const rate = currencyRates[currency] || 1;
        return (val * rate).toLocaleString(undefined, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    return (
        <span className={className}>
            {convertPrice(amount)}
        </span>
    );
};

export default Price;
