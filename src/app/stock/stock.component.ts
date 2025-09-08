import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NAVBARComponent } from '../navbar/navbar.component';
import { Stock, StockService } from './stock.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, NAVBARComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class STOCKComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  filterCategory = '';
  searchTerm = '';
  uniqueCategories: string[] = []; // For category buttons

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadStocks();
    this.stockService.refresh$.subscribe(() => this.loadStocks());
  }

  loadStocks(): void {
    this.stockService.getStocks().subscribe((data) => {
      this.stocks = data;

      // Extract unique categories for buttons
      this.uniqueCategories = [...new Set(this.stocks.map((s) => s.CATEGORY))];

      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredStocks = this.stocks.filter(
      (s) =>
        (this.filterCategory ? s.CATEGORY === this.filterCategory : true) &&
        s.PRODUCTNAME.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Called when a category button is clicked
  setCategoryFilter(category: string): void {
    this.filterCategory = category;
    this.applyFilters();
  }

  clearCategoryFilter(): void {
    this.filterCategory = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.clearCategoryFilter();
  }

  back(): void {
    window.history.back();
  }
}
