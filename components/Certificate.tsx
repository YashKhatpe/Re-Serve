'use client';

import React from 'react';
import { forwardRef } from 'react';
import { JSX } from 'react';

type Props = {
    userName: string;
    badge: {
        title: string;
        description: string;
        required: number;
        icon: JSX.Element;
    };
    mealsServed: number;
};

const Certificate = forwardRef<HTMLDivElement, Props>(
    ({ userName, badge, mealsServed }, ref) => {
        return (
            <div
                ref={ref}
                style={{
                    width: '800px',
                    height: '600px',
                    padding: '40px',
                    backgroundColor: '#ffffff',
                    color: '#1f2937', // gray-800
                    borderRadius: '20px',
                    fontFamily: 'sans-serif',
                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                }}
            >
                <h1 style={{ color: '#f97316', fontSize: '2.5rem', marginBottom: '20px' }}>
                    Certificate of Achievement
                </h1>

                <p style={{ fontSize: '1.25rem', marginTop: '10px' }}>This certifies that</p>

                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>
                    {userName}
                </h2>

                <p style={{ fontSize: '1.1rem' }}>
                    has unlocked the <strong>{badge.title}</strong> badge
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '16px' }}>
                    {badge.description}
                </p>

                <p style={{ fontSize: '1rem', color: '#4b5563' }}>
                    Meals Served: <strong>{mealsServed}</strong>
                </p>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                    {React.cloneElement(badge.icon, { color: '#f97316', size: 48 })}
                </div>


                <div style={{ marginTop: '40px', color: '#9ca3af', fontSize: '0.9rem' }}>
                    Re-Serve Food Donation Platform
                </div>
            </div>
        );
    }
);

Certificate.displayName = 'Certificate';
export default Certificate;
