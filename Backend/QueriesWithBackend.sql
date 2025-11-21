--===================SIGN UP QUERY=================
-- Replace values with actual test data
INSERT INTO Users (UserName, PasswordHash, Role, Email, Phone)
VALUES ('AliceParent', 'pass1234', 'PARENT', 'alice@example.com', '+923001234567');

SELECT COUNT(*) AS UserExists 
FROM Users 
WHERE Email = 'alice@example.com' OR UserName = 'AliceParent';

--====================SIGN IN QUERY==================
SELECT UserId, UserName, Role 
FROM Users 
WHERE Email = 'alice@example.com' AND PasswordHash = 'pass1234';

SELECT * FROM Parents
SELECT * FROM Children
SELECT * FROM Devices
SELECT * FROM Messages

DELETE FROM Messages WHERE ChildId IS NOT NULL