import React, { memo } from 'react';
import { useStore } from '../store/useStore';

const Price = memo(({ amount, className = "" }) => {
    const currency = useStore(state => state.currency || 'INR');
    const currencyRates = useStore(state => state.currencyRates || { 'INR': 1, 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0093 });

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
});

export default Price;
