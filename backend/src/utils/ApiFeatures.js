// backend/src/utils/ApiFeatures.js

class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;       // Mongoose query (Product.find())
    this.queryStr = queryStr; // req.query (URL parameters)
  }

  // ========================
  //        SEARCH
  // ========================
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,  // Pattern matching
            $options: "i",                   // Case-insensitive
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this; // Return 'this' for method chaining
  }

  // ========================
  //        FILTER
  // ========================
  filter() {
    // Create a copy (don't modify original)
    const queryCopy = { ...this.queryStr };

    // Remove fields that are NOT filters
    const removeFields = ["keyword", "page", "limit", "sort"];
    removeFields.forEach((field) => delete queryCopy[field]);

    // Convert operators for MongoDB: gt → $gt, gte → $gte, etc.
    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  // ========================
  //         SORT
  // ========================
  sort() {
    if (this.queryStr.sort) {
      // sort=price,ratings → "price ratings"
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // Default: newest first
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // ========================
  //      PAGINATION
  // ========================
  paginate(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

export default ApiFeatures;