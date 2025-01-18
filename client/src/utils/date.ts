import moment from 'moment-timezone';

export function formatDateTime(isoDateString: string) {
    // Get the system's current timezone
    const systemTimezone = moment.tz.guess();

    return moment(isoDateString).tz(systemTimezone).format('DD/MM/YYYY HH:mm:ss');
}