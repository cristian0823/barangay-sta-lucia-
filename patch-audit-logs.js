/**
 * patch-audit-logs.js
 * Patches existing audit_log entries where action='UPDATE' to their true action
 * based on the entity_type column, so they display perfectly in the UI.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function patchLogs() {
    // Read Supabase config
    const configPath = path.join(__dirname, 'js', 'supabase-config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const urlMatch = configContent.match(/const SUPABASE_URL = '(.*?)';/);
    const keyMatch = configContent.match(/const SUPABASE_ANON_KEY = '(.*?)';/);

    if (!urlMatch || !keyMatch) {
        console.error('Could not parse Supabase config');
        return;
    }

    const supabase = createClient(urlMatch[1], keyMatch[1]);

    console.log('Fetching audit logs with action=UPDATE...');
    const { data, error } = await supabase.from('audit_log').select('*').eq('action', 'UPDATE');

    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }

    console.log(`Found ${data.length} logs to patch.`);

    let updatedCount = 0;
    for (const log of data) {
        // entity_type contains the true action from the old logActivity code
        const trueAction = log.entity_type;
        
        // Derive proper entity_type based on the true action
        let trueEntity = 'System';
        if (trueAction.includes('Borrow') || trueAction.includes('Inventory')) trueEntity = 'Equipment';
        else if (trueAction.includes('Reservation') || trueAction.includes('Court') || trueAction.includes('Booking')) trueEntity = 'Reservation';
        else if (trueAction.includes('Concern')) trueEntity = 'Concerns';
        else if (trueAction.includes('Event')) trueEntity = 'Events';
        else if (trueAction.includes('User') || trueAction.includes('Suspended') || trueAction.includes('Delete')) trueEntity = 'Account Management';

        // Update the log
        const { error: updateError } = await supabase.from('audit_log').update({
            action: trueAction,
            entity_type: trueEntity
        }).eq('id', log.id);

        if (!updateError) updatedCount++;
    }

    console.log(`✅ Successfully patched ${updatedCount} audit logs!`);
}

patchLogs();
