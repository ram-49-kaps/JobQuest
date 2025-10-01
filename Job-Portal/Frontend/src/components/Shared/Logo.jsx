import React from 'react';
import logoImage from '/Users/kapadia/Desktop/Job-Portal/Frontend/src/components/Shared/Leonardo_Phoenix_10_A_modern_sleek_and_professional_letter_log_1.jpg'; // Import your logo image

function Logo({ width = '40px', height = 'auto' }) { 
  return (
    <img src={logoImage} alt="Job Quest Logo" width={width} height={height}
    className='rounded-md'
    />
  );
}

export default Logo;