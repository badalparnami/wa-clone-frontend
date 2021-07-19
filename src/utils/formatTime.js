const formatTime = (timeString) => {
  let splitTimeString = timeString.split(":");
  return `${splitTimeString[0]}:${splitTimeString[1]}`;
};

export const formatDateForSidebar = (d) => {
  const date = new Date(d);
  const isT = isToday(date);
  if (isT) {
    const timeString = date.toLocaleTimeString();
    const [h, m, s] = timeString.split(":");
    return `${h}:${m} ${s.split(" ")[1]}`;
  }
  const isY = isYesterday(date);
  if (isY) {
    return "Yesterday";
  }
  return `${date.getMonth() + 1}/${date.getDate()}/${date
    .getFullYear()
    .toString()
    .substr(-2)}`;
};

export const formatDateToTimeForChatMessages = (d) => {
  const date = new Date(d);
  const timeString = date.toLocaleTimeString();
  const [h, m, s] = timeString.split(":");
  return `${h}:${m} ${s.split(" ")[1]}`;
};

export const sameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isToday = (someDate) => {
  const today = new Date();
  const sd = new Date(someDate);

  return (
    sd.getDate() == today.getDate() &&
    sd.getMonth() == today.getMonth() &&
    sd.getFullYear() == today.getFullYear()
  );
};

export const isYesterday = (someDate) => {
  const today = new Date();
  const yesterday = new Date();
  const sd = new Date(someDate);

  yesterday.setDate(today.getDate() - 1);

  return (
    sd.getDate() == yesterday.getDate() &&
    sd.getMonth() == yesterday.getMonth() &&
    sd.getFullYear() == yesterday.getFullYear()
  );
};

export const MONTH = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

export const lastSeenFormatter = (lastSeen) => {
  const isT = isToday(lastSeen);
  const isY = isYesterday(lastSeen);
  const ls = new Date(lastSeen);

  const timeString = ls.toLocaleTimeString();
  const [h, m, s] = timeString.split(":");
  const join = `${h}:${m} ${s.split(" ")[1]}`;

  if (isT || isY) {
    return isT
      ? `last seen today at ${join}`
      : `last seen yesterday at ${join}`;
  } else {
    const month = MONTH[ls.getMonth()];
    const date = ls.getDate();

    return `last seen ${month} ${date}, ${join}`;
  }
};

export default formatTime;
