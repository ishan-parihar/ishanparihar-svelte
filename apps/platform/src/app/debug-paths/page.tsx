import React from "react";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Server-side data fetching
async function getDebugData() {
  try {
    // Initialize Supabase client
    const supabase = createServiceRoleClient();
    
    if (!supabase) {
      return { error: "Failed to initialize Supabase client" };
    }

    // Fetch all services with path information
    const { data: servicesData, error: servicesError } = await supabase
      .from("products_services")
      .select("*")
      .order("path", { ascending: true });

    if (servicesError) {
      console.error("Error fetching services:", servicesError);
      return { error: `Error fetching services: ${servicesError.message}` };
    }

    // Try to call the RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_featured_offerings_by_path");

    if (rpcError) {
      console.error("Error calling RPC function:", rpcError);
      return { 
        error: `Error calling RPC function: ${rpcError.message}`,
        allServices: servicesData || []
      };
    }

    // Also try the debug RPC function
    const { data: debugRpcData, error: debugRpcError } = await supabase.rpc("get_featured_offerings_by_path_debug");

    if (debugRpcError) {
      console.error("Error calling debug RPC function:", debugRpcError);
    } else {
      console.log("Debug RPC function returned:", debugRpcData);
    }

    return {
      offerings: rpcData || [],
      allServices: servicesData || [],
      debugRpcData: debugRpcData || null
    };

  } catch (err) {
    console.error("Error in getDebugData:", err);
    return { error: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

export default async function DebugPathsPage() {
  const data = await getDebugData();
  
  if ('error' in data && data.error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Paths Page</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {data.error}
        </div>
      </div>
    );
  }

  const { offerings = [], allServices = [] } = data as { offerings: any[], allServices: any[] };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Paths Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">RPC Function Results</h2>
        {offerings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {offerings.map((offering) => (
              <div key={offering.id} className="border p-4 rounded">
                <h3 className="font-bold">{offering.title}</h3>
                <p>Path: {offering.path}</p>
                <p>Published: {offering.published ? 'Yes' : 'No'}</p>
                <p>Available: {offering.available ? 'Yes' : 'No'}</p>
                <p>Slug: {offering.slug}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No offerings returned from RPC function</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">All Services with Paths</h2>
        {allServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Title</th>
                  <th className="py-2 px-4 border">Path</th>
                  <th className="py-2 px-4 border">Published</th>
                  <th className="py-2 px-4 border">Available</th>
                  <th className="py-2 px-4 border">Featured</th>
                  <th className="py-2 px-4 border">Slug</th>
                </tr>
              </thead>
              <tbody>
                {allServices.map((service) => (
                  <tr key={service.id}>
                    <td className="py-2 px-4 border">{service.title}</td>
                    <td className="py-2 px-4 border">{service.path || 'NULL'}</td>
                    <td className="py-2 px-4 border">{service.published ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4 border">{service.available ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4 border">{service.featured ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4 border">{service.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No services found</p>
        )}
      </div>
    </div>
  );
}