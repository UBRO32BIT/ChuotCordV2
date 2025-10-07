const GuildInviteExpirationEnum = Object.freeze({
    THIRTY_MINUTES: '30m',
    ONE_HOUR: '1h',
    SIX_HOURS: '6h',
    ONE_DAY: '1d',
    THREE_DAYS: '3d',
    SEVEN_DAYS: '7d',
    NEVER: 'never'
});

const GUILD_INVITE_EXPIRATION_VALUES = Object.values(GuildInviteExpirationEnum);

module.exports = { GuildInviteExpirationEnum, GUILD_INVITE_EXPIRATION_VALUES };