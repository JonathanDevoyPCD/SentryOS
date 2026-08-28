import ChartModule from "react-apexcharts";
import { trafficOptions, trafficSeries } from "./mock-data";

const Chart = ChartModule.default ?? ChartModule;

export default function TrafficChart() {
  return <Chart options={trafficOptions} series={trafficSeries} type="area" height={285} />;
}
