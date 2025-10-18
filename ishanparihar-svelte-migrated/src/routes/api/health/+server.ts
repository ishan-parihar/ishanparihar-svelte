import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createServiceRoleClient } from '$lib/server/supabase';

export async function GET(event: RequestEvent) {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const supabase = createServiceRoleClient();
    const { count: userCount, error: dbError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    
    // Check uptime
    const uptime = process.uptime();
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: dbError ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      responseTime: `${responseTime}ms`,
      database: {
        status: dbError ? 'error' : 'connected',
        users: userCount || 0
      },
      memory: {
        used: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'development'
    };
    
    const statusCode = dbError ? 503 : 200;
    return json(health, { status: statusCode });
  } catch (error) {
    return json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}