export interface DashboardAlertDTO {
  id: number;
  message: string;
  severity: string;
  timestamp: string;
  machine: {
    name: string;
    asetId: string;
  };
}

export interface DashboardSummaryDTO {
  summary: {
    totalMachines: number;
    criticalMachines: number;
    todaysAlerts: number;
    systemHealth: number;
  };
  recentAlerts: DashboardAlertDTO[];
}
