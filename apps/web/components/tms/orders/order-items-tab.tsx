"use client";

import { Order, OrderItem } from "@/types/orders";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrderItemsTab({ order }: { order: Order }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Quantity</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Weight (lbs)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items.map((item: OrderItem) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.quantity} PCs</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">{item.weightLbs?.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
