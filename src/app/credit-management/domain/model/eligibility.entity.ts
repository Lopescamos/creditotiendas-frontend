export interface PurchaseRequestEligibility {
  eligible: boolean;
  profileActive: boolean;
  firstSalePaidOnTime: boolean;
  noOverdueInstallments: boolean;
  withinAvailableCredit: boolean;
  availableCredit: number;
  failureReasons: string[];
}
