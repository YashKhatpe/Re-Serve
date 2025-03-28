// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// // Simplified world map topology
// const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

// const countryColors = {
//   USA: "#f59e0b",
//   Canada: "#3b82f6",
//   Brazil: "#ef4444",
//   Argentina: "#ec4899",
//   Russia: "#8b5cf6",
//   China: "#6366f1",
//   India: "#10b981",
//   Australia: "#14b8a6",
// };

// export function SalesMapping() {
//   return (
//     <Card className="border-0 shadow-sm">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-lg font-medium">Sales Mapping by Country</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-[250px]">
//           <ComposableMap
//             projectionConfig={{
//               scale: 140,
//               rotation: [-11, 0, 0],
//             }}
//             width={800}
//             height={400}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <Geographies geography={geoUrl}>
//               {({ geographies }) =>
//                 geographies.map((geo) => {
//                   const countryName = geo.properties.name;
//                   const color = countryColors[countryName] || "#e5e7eb";
//                   return (
//                     <Geography
//                       key={geo.rsmKey}
//                       geography={geo}
//                       fill={color}
//                       stroke="#D6D6DA"
//                       strokeWidth={0.5}
//                       style={{
//                         default: { outline: "none" },
//                         hover: { outline: "none", fill: color },
//                         pressed: { outline: "none" },
//                       }}
//                     />
//                   );
//                 })
//               }
//             </Geographies>
//           </ComposableMap>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }