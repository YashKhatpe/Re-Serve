import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecentDonationsProps {
  selectedNGO: string;
  selectedFoodType: string;
}

const RecentDonations = ({
  selectedNGO,
  selectedFoodType,
}: RecentDonationsProps) => {
  // Sample data - in real app, this would come from Supabase
  const donations = [
    {
      id: 1,
      foodName: "Vegetable Curry",
      foodType: "Cooked Food",
      serves: 50,
      ngo: "Hope Foundation",
      status: "picked",
      createdAt: "2024-01-07T10:30:00Z",
      expiryDateTime: "2024-01-07T18:00:00Z",
    },
    {
      id: 2,
      foodName: "Fresh Bread",
      foodType: "Bakery",
      serves: 25,
      ngo: "Community Kitchen",
      status: "pending",
      createdAt: "2024-01-07T09:15:00Z",
      expiryDateTime: "2024-01-08T08:00:00Z",
    },
    {
      id: 3,
      foodName: "Rice & Dal",
      foodType: "Cooked Food",
      serves: 80,
      ngo: "Meal Angels",
      status: "in_transit",
      createdAt: "2024-01-06T16:45:00Z",
      expiryDateTime: "2024-01-07T20:00:00Z",
    },
    {
      id: 4,
      foodName: "Fruit Salad",
      foodType: "Fresh Produce",
      serves: 30,
      ngo: "Street Support",
      status: "picked",
      createdAt: "2024-01-06T14:20:00Z",
      expiryDateTime: "2024-01-07T12:00:00Z",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        variant: "outline" as const,
        color: "text-yellow-600 border-yellow-200",
        label: "Pending",
      },
      in_transit: {
        variant: "outline" as const,
        color: "text-blue-600 border-blue-200",
        label: "In Transit",
      },
      picked: {
        variant: "outline" as const,
        color: "text-green-600 border-green-200",
        label: "Completed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Recent Donations
        </CardTitle>
        <p className="text-sm text-gray-600">
          Latest food donations and their pickup status
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Food Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serves</TableHead>
                <TableHead>NGO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow
                  key={donation.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {donation.foodName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {donation.foodType}
                    </Badge>
                  </TableCell>
                  <TableCell>{donation.serves} people</TableCell>
                  <TableCell className="text-orange-600 font-medium">
                    {donation.ngo}
                  </TableCell>
                  <TableCell>{getStatusBadge(donation.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(donation.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(donation.expiryDateTime)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentDonations;
