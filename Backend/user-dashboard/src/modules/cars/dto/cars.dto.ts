import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateDriveBookingDto {
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @IsString()
  @IsNotEmpty()
  trackLocation!: string;

  @IsDateString()
  bookingDate!: string;
}

export interface CarInventoryItemResponse {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  vaultLocation: string;
  insuredValue: number;
  hagertyIndex: number;
  userHolding: {
    sharePct: number;
    equityUsd: number;
  };
}

export interface ValuationsResponse {
  benchmarkIndex: string;
  oneYearDeltaPct: number;
  fiveYearCagrPct: number;
  lastUpdated: string;
  auctionComps: {
    auctionHouse: string;
    event: string;
    date: string;
    vehicle: string;
    hammerPriceUsd: number;
  }[];
}

export interface VaultLogisticsResponse {
  vaultFacilities: {
    facilityId: string;
    name: string;
    location: string;
    temperatureCelsius: number;
    relativeHumidityPct: number;
    hvacStatus: string;
    biometricAccessStatus: string;
    lloydsInsuranceLimitUsd: number;
    bondedStatus: string;
  }[];
}

export interface FleetMonetizationResponse {
  totalCharterDays: number;
  grossYieldUsd: number;
  userDividendUsd: number;
  rentalLogs: {
    id: string;
    vehicle: string;
    client: string;
    event: string;
    durationDays: number;
    revenueUsd: number;
    date: string;
  }[];
}

export interface DriveBookingResponse {
  id: string;
  carId: string;
  vehicle: string;
  trackLocation: string;
  bookingDate: string;
  status: string;
  createdAt: string;
}

export interface ProvenanceResponse {
  vin: string;
  vehicle: string;
  originalDeliveryDate: string;
  matchingNumbers: boolean;
  certificates: {
    date: string;
    facility: string;
    inspectionScore: number;
    odometerKm: number;
    verificationHash: string;
  }[];
}
