export const toISO = (d: string) => { const [m, day, y] = d.split('/'); 
    const dt = new Date(+y, +m - 1, +day); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}T00:00:00.000`; 
};