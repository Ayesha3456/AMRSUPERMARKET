import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService, Product } from './product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NAVBARComponent } from '../navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { StockService, Stock } from '../stock/stock.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NAVBARComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class PRODUCTComponent implements OnInit {

  categories = [
    { id: 1, category: 'SNACKS' },
    { id: 2, category: 'PRODUCE' },
    { id: 3, category: 'FROZEN' },
    { id: 4, category: 'GROCERIES' },
    { id: 5, category: 'HOUSEHOLDS' },
    { id: 6, category: 'PERSONAL CARE' },
  ];

  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;

  // Form fields
  selectedCategory: string = '';
  productName: string = '';
  brandName: string = '';
  stock: number | null = null;
  mrp: number | null = null;

  searchTerm: string = '';
  isModalOpen: boolean = false;

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Load products
  loadProducts(): void {
    this.productService.getProducts().subscribe((res: Product[]) => {
      this.products = res.map((p, index) => ({ ...p, SNO: index + 1 }));
      this.filteredProducts = [...this.products];
    });
  }

  // Modal open/close
  openModal(): void {
    this.resetForm();
    this.isModalOpen = true;
  }

  openEditModal(product: Product): void {
    this.selectedProduct = { ...product };
    this.selectedCategory = this.selectedProduct.CATEGORY;
    this.productName = this.selectedProduct.PRODUCTNAME;
    this.brandName = this.selectedProduct.BRANDNAME;
    this.stock = this.selectedProduct.STOCK;
    this.mrp = this.selectedProduct.MRP;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  // Search
  search(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.PRODUCTNAME.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  // Save Product + create stock
  saveProducts(): void {
    if (!this.productName || !this.brandName || !this.stock || !this.mrp || !this.selectedCategory) {
      alert("Please fill in all fields.");
      return;
    }

    const newProduct: Omit<Product, 'id'> = {
      CATEGORY: this.selectedCategory.toUpperCase(),
      PRODUCTNAME: this.productName.toUpperCase(),
      BRANDNAME: this.brandName.toUpperCase(),
      STOCK: this.stock!,
      MRP: this.mrp!,
    };

    this.productService.addProduct(newProduct).subscribe((saved) => {
      alert("Product saved successfully!");
      this.loadProducts();

      // also add stock
      const stock: Stock = {
        PRODUCT: saved.id,
        CATEGORY: saved.CATEGORY,
        PRODUCTNAME: saved.PRODUCTNAME,
        BRANDNAME: saved.BRANDNAME,
        STOCK: saved.STOCK
      };

      this.stockService.addStock(stock).subscribe(() => {
        this.stockService.notifyRefresh();
      });

      this.closeModal();
    });
  }

  // Update Product + stock
  updateProduct(): void {
    if (this.selectedProduct) {
      this.selectedProduct.CATEGORY = this.selectedCategory.toUpperCase();
      this.selectedProduct.PRODUCTNAME = this.productName.toUpperCase();
      this.selectedProduct.BRANDNAME = this.brandName.toUpperCase();
      this.selectedProduct.STOCK = this.stock!;
      this.selectedProduct.MRP = this.mrp!;

      this.productService.updateProduct(this.selectedProduct).subscribe((updated) => {
        alert("Product updated successfully!");
        this.loadProducts();

        // update stock
        const stock: Stock = {
          PRODUCT: updated.id,
          CATEGORY: updated.CATEGORY,
          PRODUCTNAME: updated.PRODUCTNAME,
          BRANDNAME: updated.BRANDNAME,
          STOCK: updated.STOCK
        };

        this.stockService.updateStock(stock).subscribe(() => {
          this.stockService.notifyRefresh();
        });

        this.closeModal();
      });
    }
  }

  // Delete Product + stock
  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete ${product.PRODUCTNAME}?`)) {
      this.productService.deleteProduct(product.id).subscribe(() => {
        alert("Product deleted successfully!");
        this.loadProducts();

        // also delete stock
        this.stockService.getStockByProduct(product.id).subscribe(stock => {
          if (stock) {
            this.http.delete(`${this.stockService['apiUrl']}${stock.PRODUCT}/`).subscribe(() => {
              this.stockService.notifyRefresh();
            });
          }
        });
      });
    }
  }

  // Reset Form
  resetForm(): void {
    this.selectedProduct = null;
    this.selectedCategory = '';
    this.productName = '';
    this.brandName = '';
    this.stock = null;
    this.mrp = null;
  }
}
