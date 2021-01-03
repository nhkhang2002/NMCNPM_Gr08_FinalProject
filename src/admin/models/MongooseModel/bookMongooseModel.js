const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;
const { ObjectId } = require('mongodb');

const book = new Schema({
    title: String,
    cover: String,
    oldPrice: String,
    salePrice: String,
    detail: String,
    decription: String,
    isDeleted: Boolean,
    nameCategory: String,
    categoryID: ObjectId,
    titleUnsigned: String,
    status: String,
    comments: Array
}, { collection: 'books' });

book.plugin(mongoosePaginate);

module.exports = mongoose.model('books', book);