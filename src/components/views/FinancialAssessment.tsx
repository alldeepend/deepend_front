import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import FinancialAssessmentBasic from './FinancialAssessmentBasic';
import FinancialAssessmentAdvanced from './FinancialAssessmentAdvanced';

export default function FinancialAssessment() {
    const { user } = useAuth();
    // Default to 'basic' if user or level is missing for now, or fetch from user object
    const userLevel = (user as any)?.level || 'basic';

    if (userLevel === 'advanced' || userLevel === 'medio') { // Handling potential 'medio' from prompt context
        return <FinancialAssessmentAdvanced />;
    }

    return <FinancialAssessmentBasic />;
}
