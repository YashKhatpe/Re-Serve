import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const products = [
  {
    id: "01",
    name: "Rice & Dal",
    popularity: 45,
    color: "bg-blue-500",
  },
  {
    id: "02",
    name: "Vegetable Curry",
    popularity: 29,
    color: "bg-emerald-500",
  },
  {
    id: "03",
    name: "Bread & Soup",
    popularity: 18,
    color: "bg-purple-500",
  },
  {
    id: "04",
    name: "Fruits & Snacks",
    popularity: 25,
    color: "bg-orange-500",
  },
];

export function TopProducts() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Most Donated Meals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
        <div className="grid grid-cols-12 text-xs text-gray-500 mb-2">
    <div className="col-span-1">#</div>
    <div className="col-span-5">Meal Name</div>
    <div className="col-span-5">Popularity</div>
    <div className="col-span-1">Donations</div>
</div>

          {products.map((product) => (
            <div key={product.id} className="grid grid-cols-12 items-center">
              <div className="col-span-1 text-sm font-medium">{product.id}</div>
              <div className="col-span-5 text-sm">{product.name}</div>
              <div className="col-span-5">
                <Progress value={product.popularity} className={product.color} />
              </div>
              <div className="col-span-1 text-sm font-medium">{product.popularity}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}