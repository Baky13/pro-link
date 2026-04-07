-- V8__fix_demo_passwords.sql
UPDATE users
SET password = '$2a$10$TQT1yHmlPjAOmDpkFjqQZufqPnZ2l9Mm8AIpELWpL2alYsF169P7m'
WHERE email IN (
    'techbishkek@prolink.kg',
    'fintechkg@prolink.kg',
    'medcenter@prolink.kg',
    'worker1@prolink.kg',
    'worker2@prolink.kg'
);
