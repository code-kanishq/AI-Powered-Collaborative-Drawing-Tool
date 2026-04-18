const { execSync } = require('child_process');

const ports = [3000, 3001, 8081];

console.log('Checking for processes on ports:', ports.join(', '));

ports.forEach(port => {
    try {
        // Find process using the port (Windows)
        const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: 'pipe' });
        const lines = result.trim().split('\n').filter(line => line.includes('LISTENING'));
        
        if (lines.length > 0) {
            const pids = new Set();
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && !isNaN(pid)) {
                    pids.add(pid);
                }
            });
            
            pids.forEach(pid => {
                try {
                    console.log(`Killing process ${pid} on port ${port}...`);
                    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                    console.log(`✓ Killed process ${pid} on port ${port}`);
                } catch (e) {
                    // Process might already be dead
                }
            });
        } else {
            console.log(`✓ Port ${port} is free`);
        }
    } catch (e) {
        // Port is free or command failed
        console.log(`✓ Port ${port} is free`);
    }
});

console.log('Port cleanup complete!\n');


