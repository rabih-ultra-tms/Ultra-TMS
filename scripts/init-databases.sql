-- Create development and test databases
CREATE DATABASE tms_dev;
CREATE DATABASE tms_test;

-- Grant privileges to the default user
GRANT ALL PRIVILEGES ON DATABASE tms_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tms_test TO postgres;
