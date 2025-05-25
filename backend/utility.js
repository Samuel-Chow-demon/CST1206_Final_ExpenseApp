
const getDateAfter = ({day = 0, hr = 0, min = 0, sec = 0}={})=>
{
    const now = Date.now();
    return {
        now: new Date(now).toISOString(),
        expire: new Date(now + ((day * 24 * 60 * 60 * 1000) +
                                (hr * 60 * 60 * 1000) +
                                (min * 60 * 1000) +
                                (sec * 1000))
        )
    };
}

module.exports={
    getDateAfter
};