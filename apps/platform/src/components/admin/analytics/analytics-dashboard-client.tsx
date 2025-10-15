"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell } from "recharts";
import { api } from "@/lib/trpc-client";

interface AnalyticsDashboardClientProps {
  initialTotalEvents?: number;
  initialUniqueVisitors?: number;
  initialTopEvents?: { event_name: string; count: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function AnalyticsDashboardClient({
  initialTotalEvents = 0,
  initialUniqueVisitors = 0,
  initialTopEvents = [],
}: AnalyticsDashboardClientProps) {
  const [totalEvents, setTotalEvents] = useState(initialTotalEvents);
  const [uniqueVisitors, setUniqueVisitors] = useState(initialUniqueVisitors);
  const [topEvents, setTopEvents] = useState(initialTopEvents);
  const [dateRange, setDateRange] = useState(30); // Default to 30 days
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [offeringPerformance, setOfferingPerformance] = useState<any[]>([]);

  // Fetch data using tRPC
  const { data: totalEventsData, isLoading: isLoadingTotalEvents } = 
    api.analytics.getTotalEvents.useQuery(undefined, {
      initialData: { count: initialTotalEvents },
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  const { data: uniqueVisitorsData, isLoading: isLoadingUniqueVisitors } = 
    api.analytics.getUniqueVisitors.useQuery(undefined, {
      initialData: { count: initialUniqueVisitors },
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  const { data: topEventsData, isLoading: isLoadingTopEvents } = 
    api.analytics.getTopEvents.useQuery({ limit: 10 }, {
      initialData: { events: initialTopEvents },
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  // Fetch conversion funnel data
  const { data: funnelDataResult, isLoading: isLoadingFunnel } = 
    api.analytics.getConversionFunnel.useQuery({ days: dateRange }, {
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  // Fetch offering performance data
  const { data: offeringPerformanceData, isLoading: isLoadingOfferingPerformance } = 
    api.analytics.getOfferingPerformance.useQuery({ days: dateRange }, {
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  // Update state when data changes
  useEffect(() => {
    if (totalEventsData) {
      setTotalEvents(totalEventsData.count);
    }
  }, [totalEventsData]);

  useEffect(() => {
    if (uniqueVisitorsData) {
      setUniqueVisitors(uniqueVisitorsData.count);
    }
  }, [uniqueVisitorsData]);

  useEffect(() => {
    if (topEventsData) {
      setTopEvents(topEventsData.events);
    }
  }, [topEventsData]);

  useEffect(() => {
    if (funnelDataResult) {
      // Format data for the funnel chart
      const funnelSteps = [
        { name: "Viewed Offering", value: funnelDataResult.viewedOffering },
        { name: "Initiated Checkout", value: funnelDataResult.initiatedCheckout },
        { name: "Completed Sale", value: funnelDataResult.completedSale },
      ];
      setFunnelData(funnelSteps);
    }
  }, [funnelDataResult]);

  useEffect(() => {
    if (offeringPerformanceData) {
      setOfferingPerformance(offeringPerformanceData);
    }
  }, [offeringPerformanceData]);

  // Format data for the chart
  const chartData = topEvents.map((event) => ({
    name: event.event_name,
    count: event.count,
  }));

  // Handle date range change
  const handleDateRangeChange = (days: number) => {
    setDateRange(days);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-md ${
            dateRange === 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => handleDateRangeChange(1)}
        >
          Last 24 Hours
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            dateRange === 7
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => handleDateRangeChange(7)}
        >
          Last 7 Days
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            dateRange === 30
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => handleDateRangeChange(30)}
        >
          Last 30 Days
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingTotalEvents ? "..." : totalEvents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        {/* Unique Visitors Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingUniqueVisitors ? "..." : uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        {/* Placeholder Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m 34s</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.3%</div>
            <p className="text-xs text-muted-foreground">-2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {isLoadingFunnel ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Offering Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Offering Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {isLoadingOfferingPerformance ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={offeringPerformance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  dataKey="offeringTitle" 
                  type="category" 
                  width={140}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Conversion Rate"]}
                  labelFormatter={(value) => `Offering: ${value}`}
                />
                <Bar 
                  dataKey="conversionRate" 
                  fill="#8884d8" 
                  name="Conversion Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingTopEvents ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTopEvents ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : topEvents.length > 0 ? (
                topEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.event_name}</TableCell>
                    <TableCell className="text-right">{event.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}