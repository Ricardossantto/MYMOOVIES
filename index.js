const express = require("express");
const bodyParser = require("body-parser");
const categoryRoutes = require('./src/routes/category');
const mooviesRoutes = require('./src/routes/moovies');

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(bodyParser.json());

app.use("/category", categoryRoutes);
app.use("/moovies", mooviesRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});