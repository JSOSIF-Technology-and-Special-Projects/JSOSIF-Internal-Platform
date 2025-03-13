-- Create Teams Table
CREATE TABLE Teams (
  teamId UUID PRIMARY KEY DEFAULT gen_random_uuid()
  , name VARCHAR(255) NOT NULL
  , banner TEXT
);

-- Create Investment Divisions Table
CREATE TABLE InvestmentDivisions (
  investmentDivisionId UUID PRIMARY KEY DEFAULT gen_random_uuid()
  , name VARCHAR(255) NOT NULL
  , description TEXT
  , bgImage TEXT
);

-- Create Support Teams Table
CREATE TABLE SupportTeams (
  supportTeamId UUID PRIMARY KEY DEFAULT gen_random_uuid()
  , name VARCHAR(255) NOT NULL
  , description TEXT
);

-- Create Members Table
CREATE TABLE Members (
  memberId UUID PRIMARY KEY DEFAULT gen_random_uuid()
  , firstName VARCHAR(255) NOT NULL
  , lastName VARCHAR(255) NOT NULL
  , role VARCHAR(255)
  , program VARCHAR(255)
  , year VARCHAR(128)
  , joined DATE
  , image TEXT
  , linkedIn TEXT
  , teamId UUID REFERENCES Teams(teamId)
  ON DELETE SET NULL
);

-- Create Alumni Table
CREATE TABLE Alumni (
  alumniId UUID PRIMARY KEY DEFAULT gen_random_uuid()
  , firstName VARCHAR(255) NOT NULL
  , lastName VARCHAR(255) NOT NULL
  , position VARCHAR(255)
  , company VARCHAR(255)
  , program VARCHAR(255)
  , yearsOnFund INT
  , image TEXT
  , blurb TEXT
  , linkedIn TEXT
);

-- Create Tickers Table
CREATE TABLE Tickers (
  tickerId UUID PRIMARY KEY DEFAULT gen_random_uuid()
  , ticker VARCHAR(50) NOT NULL
  , label VARCHAR(255)
  , investmentDivisionId UUID REFERENCES InvestmentDivisions(investmentDivisionId)
  ON DELETE CASCADE
);