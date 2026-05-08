const ID_PATTERNS = {
  aadhaar: /^\d{12}$/,
  passport: /^[A-PR-WY][1-9]\d{5}[1-9]$/i,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/i,
  dl: /^[A-Z0-9-]{8,20}$/i,
};

export function validateTravelers(travelers) {
  const errors = {};
  travelers.forEach((t, i) => {
    const e = {};
    if (!t.name || t.name.trim().length < 2) e.name = 'Enter a valid name';
    const age = Number(t.age);
    if (!age || age < 1 || age > 120) e.age = 'Age 1-120';
    if (!['male', 'female', 'other'].includes(t.gender)) e.gender = 'Select gender';
    if (!t.idType) e.idType = 'Select ID type';
    const pattern = ID_PATTERNS[t.idType];
    if (!t.idNumber || (pattern && !pattern.test(t.idNumber.trim())))
      e.idNumber = 'Invalid ID number';
    if (Object.keys(e).length) errors[i] = e;
  });
  return errors;
}

export function validateTravel(td) {
  const e = {};
  if (!td.startDate) e.startDate = 'Start date required';
  if (!td.endDate) e.endDate = 'End date required';
  if (td.startDate && td.endDate) {
    const s = new Date(td.startDate);
    const ed = new Date(td.endDate);
    if (s < new Date(new Date().toDateString())) e.startDate = 'Cannot be in the past';
    if (ed <= s) e.endDate = 'Must be after start';
  }
  if (!td.count || td.count < 1) e.count = 'At least 1 traveler';
  return e;
}

export function validateContact(c) {
  const e = {};
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!c.email || !emailRe.test(c.email)) e.email = 'Valid email required';
  const phoneRe = /^[+]?[0-9]{10,15}$/;
  if (!c.phone || !phoneRe.test(c.phone.replace(/\s/g, '')))
    e.phone = 'Valid phone required';
  return e;
}
